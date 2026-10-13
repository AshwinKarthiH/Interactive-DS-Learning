package com.algoverse;
import com.fasterxml.jackson.core.StreamReadConstraints;
import org.springframework.context.annotation.*;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
@Configuration
public class JsonConfig {
 @Bean Jackson2ObjectMapperBuilderCustomizer limits(){return builder->builder.postConfigurer(mapper->mapper.getFactory().setStreamReadConstraints(StreamReadConstraints.builder().maxNestingDepth(40).maxStringLength(100000).maxNumberLength(100).build()));}
}
